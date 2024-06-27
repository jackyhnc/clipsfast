import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    /*
    const allowedPaths = [
        "/_next",
        "/assets/waitlist/logo.svg"
    ]

    if (allowedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const url = new URL(request.url);

    if (url.pathname !== '/waitlist') {
        console.log("Only waitlist is available at the moment.");
        return NextResponse.redirect(new URL('/waitlist', request.url));
    }

    return NextResponse.next();
    */
}

export const config = {
    matcher: ["/:path*"],
};
