import Link from 'next/link'
import { permanentRedirect } from 'next/navigation'

export default async function NotFound() {

  return (
    <div className='min-h-screen'>
      <h2>Not Found:</h2>
      <p>Could not find requested resource</p>
      <p>
        View <Link href="/">Home</Link>
      </p>
      {/* {permanentRedirect("/")} */}

    </div>
  )
}