'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const CustomerOrdersModal = dynamic(() => import('./CustomerOrdersModal'), { ssr: false })

export default function CustomerOrdersRoot() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-orders', handler)
    return () => window.removeEventListener('open-orders', handler)
  }, [])

  return <CustomerOrdersModal open={open} onClose={() => setOpen(false)} />
}
