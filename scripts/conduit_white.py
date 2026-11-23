"""Put a studio pipe photo on pure white.
1. Seed: the pipe bores and seams (what a tight flood fill from the frame edge cannot reach).
2. GrabCut grows that seed to the whole stack.
3. The backdrop is flat-fielded to white, which keeps the soft shadow; the pipes keep their own pixels."""
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = im.shape[:2]
blur = cv2.GaussianBlur(im, (0, 0), 2)
ff = np.zeros((h + 2, w + 2), np.uint8)
flags = 4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY
for s in [(x, 2) for x in range(2, w, 40)] + [(2, y) for y in range(2, h, 40)] + [(w - 3, y) for y in range(2, h, 40)] + [(x, h - 3) for x in range(2, w, 40)]:
    if ff[s[1] + 1, s[0] + 1] == 0:
        cv2.floodFill(blur, ff, s, 0, (2, 2, 2), (2, 2, 2), flags)
core = (ff[1:-1, 1:-1] == 0).astype(np.uint8)
core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
ys, xs = np.nonzero(core)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
pad = 40
gc = np.full((h, w), cv2.GC_BGD, np.uint8)
gc[max(0, y0 - pad):min(h, y1 + pad), max(0, x0 - pad):min(w, x1 + pad)] = cv2.GC_PR_BGD
hull = cv2.convexHull(np.column_stack([xs, ys]).astype(np.int32))
hm = np.zeros((h, w), np.uint8); cv2.fillConvexPoly(hm, hull, 1)
gc[hm == 1] = cv2.GC_PR_FGD
gc[core == 1] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(im, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
fg = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.uint8)
# keep the one big piece, close pinholes
n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
keep = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
fg = (lab == keep).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
# GrabCut leaves a ragged outline where a lit pipe meets the backdrop: round it off
fg = (cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 8) > 0.5).astype(np.uint8)
# The long top edge of the top pipe is a straight line in the photo, but it is white on a near-white
# backdrop and the cut wanders a few pixels. Fit a line to that edge and cut along the line instead.
cols = np.nonzero(fg.any(axis=0))[0]
topy = np.array([np.argmax(fg[:, x]) for x in cols], dtype=np.float64)
a, b = int(len(cols) * 0.5), int(len(cols) * 0.9)
k, c = np.polyfit(cols[a:b], topy[a:b], 1)
line = k * cols + c
on = np.abs(topy - line) < 10
first = a
while first > 0 and on[first - 1]:
    first -= 1
last = b
while last < len(cols) - 1 and on[last + 1] and len(cols) - last > 12:
    last += 1
for i in range(first, last + 1):
    x, y_cut = cols[i], int(round(line[i]))
    lo = int(min(topy[i], y_cut))
    fg[lo:y_cut, x] = 0
    fg[y_cut:int(max(topy[i], y_cut)) + 1, x] = 1
print("pipes share", round(float(fg.mean()), 3), "straightened columns", last - first + 1)
# backdrop model: plane fitted per channel on pixels well away from the pipes and their shadow
far = cv2.dilate(fg, np.ones((121, 121), np.uint8)) == 0
yy, xx = np.mgrid[0:h, 0:w]
A = np.column_stack([xx[far], yy[far], np.ones(far.sum())]).astype(np.float64)
out_bg = np.empty_like(im, dtype=np.float64)
for c in range(3):
    coef, *_ = np.linalg.lstsq(A[::50], im[..., c][far][::50].astype(np.float64), rcond=None)
    plane = coef[0] * xx + coef[1] * yy + coef[2]
    out_bg[..., c] = im[..., c] / plane * 262.0   # a touch over white so backdrop noise clips clean
out_bg = np.clip(out_bg, 0, 255)
grey = out_bg.mean(axis=2, keepdims=True)          # shadow in neutral grey, no colour cast
# the shadow lives near the pipes; further out the backdrop fades to pure white so no frame edge shows
dist = cv2.distanceTransform(1 - fg, cv2.DIST_L2, 5)[..., None]
farw = np.clip((dist - 50.0) / 110.0, 0, 1)
grey = grey + (255.0 - grey) * farw
alpha = cv2.GaussianBlur(fg.astype(np.float64), (0, 0), 1.2)[..., None]
lift = 255.0 - (255.0 - im.astype(np.float64)) * 0.74   # white PVC reads as white once the backdrop is white
res = np.clip(alpha * lift + (1 - alpha) * np.repeat(grey, 3, axis=2), 0, 255).astype(np.uint8)
# frame: crop to what is not white, add an even margin, pad to 4:3
nz = np.argwhere(res.min(axis=2) < 250)
(ya, xa), (yb, xb) = nz.min(axis=0), nz.max(axis=0)
crop = res[ya:yb + 1, xa:xb + 1]
ch, cw = crop.shape[:2]
m = int(0.05 * cw)
W = cw + 2 * m; H = max(ch + 2 * m, int(round(W * 3 / 4))); W = max(W, int(round(H * 4 / 3)))
canvas = np.full((H, W, 3), 255, np.uint8)
oy, ox = (H - ch) // 2, (W - cw) // 2
canvas[oy:oy + ch, ox:ox + cw] = crop
cv2.imwrite(dst, canvas)
print("out", W, H)
