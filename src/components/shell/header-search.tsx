import { SearchIcon } from "./icons";

/**
 * Search in the desktop bar. A plain GET form to /products?q=, so it works
 * without script. The field is folded behind the icon and opens over the nav
 * when it takes focus: clicking the icon (its label) or tabbing into it.
 * Enter submits.
 */
export function HeaderSearch() {
  return (
    <form action="/products" method="get" role="search" className="relative flex items-center">
      <input
        id="header-search"
        type="search"
        name="q"
        maxLength={80}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Model, size or category"
        className="peer absolute right-full top-1/2 h-11 w-0 -translate-y-1/2 border-0 bg-white p-0 text-base text-ink opacity-0 outline-none transition-[width,opacity,padding] duration-300 ease-out-quart placeholder:text-steel focus:w-72 focus:border-[1.5px] focus:border-ink focus:px-3 focus:opacity-100"
      />
      <label
        htmlFor="header-search"
        className="inline-flex size-11 cursor-pointer items-center justify-center text-ink transition-colors hover:bg-paper peer-focus:bg-paper"
      >
        <SearchIcon className="size-[1.375rem]" />
        <span className="sr-only">Search the range</span>
      </label>
    </form>
  );
}
