import { fetchData, setSession } from '@/utils';
import { OrderMenuNav, OrderProducts } from "../../components"
import { Category, OrderItemFull } from '@/interfaces'

interface Props {
  params: {
		category: string
	}
}

export default async function OrderMenuCategoryPage({ params }: Props) {
  const { token } = await setSession()
  const products = await fetchData<OrderItemFull[]>({ url: `/products/category/${ params.category }`, token })
  const categories = await fetchData<Category[]>({ url: `/categories`, token })
  return (
    <>
    <div className="hidden md:flex p-4 md:px-6 md:py-4 md:border-b md:border-b-gray50 sticky top-14 z-[999] md:bg-surface">
      <OrderMenuNav categories={ categories }/>
    </div>
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <OrderProducts products={ products }/>
    </div>
    </>
  )
}