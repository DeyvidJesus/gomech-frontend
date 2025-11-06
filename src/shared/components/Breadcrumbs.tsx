import { Link } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-gray-600 hover:text-orangeWheel-500 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-orangeWheel-500 font-semibold' : 'text-gray-400'}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

