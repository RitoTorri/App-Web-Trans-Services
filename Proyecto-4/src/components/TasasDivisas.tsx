import { useEffect, useState } from "react";

interface ExchangeData {
  current: { usd: number; eur: number; date: string };
  previous: { usd: number; eur: number; date: string };
  changePercentage: { usd: number; eur: number };
}

function TasasDivisas() {
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.dolarvzla.com/public/exchange-rate"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: ExchangeData = await response.json();
        setExchangeData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="w-full flex items-center justify-center py-6">
+        <span className="loading loading-spinner loading-xl"></span>
+      </div>
    )
  }

  if (error) {
    return <p>Error al cargar: {error}</p>;
  }

  return (
    <>
      <main className="">
        {exchangeData && (
          <>
            <section className="grid grid-cols-2 w-full gap-10 mb-5">
              <div className="flex flex-col bg-white shadow-sm rounded-lg h-40 items-center justify-center gap-4 ">
                <span className="font-semibold text-gray-800 text-2xl">
                  Tasa Actual (USD)
                </span>
                <span className="text-3xl font-bold text-green-600">
                  Bs. {exchangeData.current.usd.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Valor del Bolivar en USD
                </span>
              </div>
              <div className="flex flex-col bg-white shadow-sm rounded-lg h-40 items-center justify-center gap-4">
                <span className="font-semibold text-gray-800 text-2xl">
                  Tasa Actual (EUR)
                </span>
                <span className="text-3xl font-bold text-blue-500">
                  Bs. {exchangeData.current.eur.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Valor del Bolivar en EUR
                </span>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default TasasDivisas;
