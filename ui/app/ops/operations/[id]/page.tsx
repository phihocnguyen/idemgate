import { OperationDetail } from "@/components/ops/OperationDetail";

export default async function OperationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OperationDetail id={id} />;
}
