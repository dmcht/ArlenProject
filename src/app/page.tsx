import { ConectaHome } from "@/components/conecta-platino/conecta-home";
import { getUserProgress } from "@/lib/conecta/get-progress";

export default async function Home() {
  const progress = await getUserProgress();
  return <ConectaHome progress={progress} />;
}
