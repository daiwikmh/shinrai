"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useSuspenseExecutions,
} from "../hooks/use-executions";
import { useRouter } from "next/navigation";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { Execution } from "@/generated/prisma/client";
import { CheckCircle2Icon, Clock2Icon, Loader2Icon, XCircleIcon } from "lucide-react";


export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      page={executions?.data?.page}
      totalPages={executions.data?.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      disabled={executions.isFetching}
    />
  );
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions.data?.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => (
        <ExecutionItem key={execution.id} data={execution} />
      )}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = ({ disabled }: { disabled: boolean }) => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow executions history"
      disabled={disabled}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader disabled={false} />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error Loading executions" />;
};
export const ExecutionsEmpty = () => {
  return (
    <>
      <EmptyView
        message="You don't have any executions yet. Run your workflow now."
      />
    </>
  );
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch(status){
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <Clock2Icon className="size-5 text-muted-foreground" />;
  }
}
export const ExecutionItem = ({ data }: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
    }
  }
}) => {
  const statusIcon = getStatusIcon(data.status);
  
  const duration = data.completedAt ? Math.round(new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime())/1000 : null;
  
  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })} 
      {duration !== null && <> &bull; Took {duration}s</>}
    </>
  )
  
  const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
  
  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {statusIcon}
        </div>
      }
    />
  );
};
