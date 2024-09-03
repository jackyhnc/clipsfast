import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type TBreadCrumbItem = {
  name: string;
  href: string;
};
export function StudioNavbar({ breadCrumbItems }: { breadCrumbItems: Array<TBreadCrumbItem> }) {
  return (
    <div className="w-full bg-[var(--bg-white)] h-20 flex items-center">
      <div className="">
        <Breadcrumb>
          <BreadcrumbList>
            {breadCrumbItems.map((item: TBreadCrumbItem) => {
              const index = breadCrumbItems.indexOf(item);
              return (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                  </BreadcrumbItem>
                  {(index !== breadCrumbItems.length - 1) && <BreadcrumbSeparator />}
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
