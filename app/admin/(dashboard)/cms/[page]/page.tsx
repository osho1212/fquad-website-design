import { notFound } from 'next/navigation';
import { getPageDef } from '@/lib/cms/schema';
import PageEditor from './PageEditor';

export default async function CmsPageRoute(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const def = getPageDef(params.page);
  if (!def) notFound();
  return <PageEditor def={def} />;
}
