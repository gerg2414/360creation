import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to generic trade page
  redirect('/trade')
}