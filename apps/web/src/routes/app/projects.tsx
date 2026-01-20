import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

export const Route = createFileRoute("/app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data, isLoading, error } = useQuery(
    api.projects.list.useQuery({
      limit: 50,
      offset: 0,
    })
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} title="Failed to load projects" />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <div className="space-y-4">
        {data?.projects?.map((project: any) => (
          <div key={project.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{project.name}</h2>
            <p className="text-sm text-gray-600">{project.status} - {project.progress}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
