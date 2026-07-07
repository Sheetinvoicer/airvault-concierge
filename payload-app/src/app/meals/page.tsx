import { getPayload } from 'payload'
import config from '@payload-config'
import MealReserveForm from './MealReserveForm'

interface Meal {
  id: string
  name: string
  description?: string
  available: boolean
}

export default async function MealsPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'meals',
    where: { available: { equals: true } },
    limit: 100,
  })

  const meals = result.docs as unknown as Meal[]

  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">🍽 In-Flight Meals</h1>
          <p className="text-gray-400">
            Browse available meals and reserve your selection before boarding.
          </p>
        </div>

        {meals.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">🍽</div>
            <p className="text-lg mb-1">No meals available right now.</p>
            <p className="text-sm">Check back later or contact your airline for meal options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
                  <span className="text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded">
                    Available
                  </span>
                </div>
                {meal.description && (
                  <p className="text-sm text-gray-400 flex-1 mb-3">{meal.description}</p>
                )}
                <MealReserveForm mealId={meal.id} mealName={meal.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
