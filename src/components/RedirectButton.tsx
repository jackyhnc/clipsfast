import Link from "next/link"

type TRedirectButtonProps = {
    children?: React.ReactNode,
    link: string,
    defaultLink?: string,
    stateOfLink?: boolean,
    scroll?: boolean,
    data?: any,
}

export default function RedirectButton(props: TRedirectButtonProps) {
    const { children, link, defaultLink, stateOfLink, scroll, data } = props

    return (
        <Link 
            href={
                {
                    pathname: stateOfLink ? link : (defaultLink?? ""),
                    query: data
                }
            } 
            scroll={scroll}

        >
            {children}
        </Link>
    )
}