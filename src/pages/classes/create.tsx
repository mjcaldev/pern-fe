import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb"
import { CreateView } from "@/components/refine-ui/views/create-view"

const create = () => {
  return (
    <CreateView className="class-view"> 
      <Breadcrumb />

      <h1 className="page-title">Create a Class</h1>

      <div></div>
    </CreateView>
  )
}

export default create