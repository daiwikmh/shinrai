"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Workflow } from "@/generated/prisma/client";
import { WorkflowIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowParams()
  const { searchValue, onSearchChange } = useEntitySearch({params, setParams})
  
  return (
    <EntitySearch 
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  )
}

export const WorkflowPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [ params, setParams ] = useWorkflowParams()
  
  return (
    <EntityPagination
    page={workflows?.data?.page}
    totalPages={workflows.data?.totalPages}
    onPageChange={(page)=> setParams({...params, page})}
    disabled={workflows.isFetching}/>  
  )
}

export const WorkflowList = () => {
  const workflows = useSuspenseWorkflows()
  return (
    <EntityList
    items={workflows.data?.items}
    getKey={(workflow) => workflow.id}
    renderItem={(workflow) => (
      <WorkflowItem key={workflow.id} data={workflow} />
    )}
    emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsHeader = ({disabled} : {disabled: boolean}) => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter()
  const {handleError, modal} = useUpgradeModal()
  
  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined,
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`)
        },
        onError: (error) => {
          handleError(error)
        }
      }
    )
  }
  
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreateWorkflow}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export const WorkflowsContainer = ({children}: {children: React.ReactNode}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader disabled={false} />}
      search={<WorkflowsSearch/>}
      pagination={<WorkflowPagination/>}
    >
      {children}
    </EntityContainer>
  )
}

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..."/>
}

export const WorkflowsError = () => {
  return <ErrorView message="Error Loading workflows"/>
}
export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter()
  const {handleError, modal} = useUpgradeModal()
  
  const handleCreate = () => {
    createWorkflow.mutate(undefined,
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`)
        },
        onError: (error) => {
          handleError(error)
        }
      }
    )
  }
  
  return (
    <>
      {modal}
      <EmptyView onNew={handleCreate} message="You haven't created any workflows yet. Create one now."/>
    </>
  )
}

export const WorkflowItem = ({data}: {data: Workflow}) => {
  const removeWorkflow = useRemoveWorkflow()
  
  const handleRemove = () => {
    removeWorkflow.mutate({id:data.id},
      {
        onError: (error) => {
          toast.error(error.message)
        }
      }
    )
  }
  
  return <EntityItem
  href={`/workflows/${data.id}`}
  title={data.name}
  subtitle={<>
    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
    &bull; Created { formatDistanceToNow(data.createdAt, { addSuffix: true })}{" "}
  </>}
  image={
    <div className="size-8 flex items-center justify-center">
      <WorkflowIcon className="size-5"/>
    </div>
  }
  actions={"Actions"}
  onRemove={handleRemove}
  isRemoving={removeWorkflow.isPending}
  />
}