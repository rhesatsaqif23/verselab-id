import { Outlet, createFileRoute } from '@tanstack/react-router'
import Header from '#/components/Header'
import Footer from '#/components/Footer'

export const Route = createFileRoute('/_home')({
  component: HomeLayout,
})

function HomeLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}