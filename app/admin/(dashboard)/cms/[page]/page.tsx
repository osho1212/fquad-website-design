import { notFound } from 'next/navigation';
import { getPageDef } from '@/lib/cms/schema';
import PageEditor from './PageEditor';

export default function CmsPageRoute({ params }: { params: { page: string } }) {
  const def = getPageDef(params.page);
  if (!def) notFound();
  return <PageEditor def={def} />;
}
