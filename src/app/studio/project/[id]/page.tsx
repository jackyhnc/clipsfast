import { redirect } from 'next/navigation'

type TStudioProjectProps = {
  params: { id: string };
};
export default function StudioProjectPage({
  params,
}: TStudioProjectProps) {
  redirect(`/studio/project/${params.id}/clips`)
}