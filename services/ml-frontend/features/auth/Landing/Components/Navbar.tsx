"use client"
import React from 'react'
import Link from 'next/link'

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between w-full px-8 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-gray-900">MINI-Tech</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Tech-Features
                    </Link>
                    <Link href="#solutions" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Solutions
                    </Link>
                    <Link href="#resources" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Resources
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Pricing
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Log in
                    </Link>
                    <button
                        className="px-5 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        demo
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
