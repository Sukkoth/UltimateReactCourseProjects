import { useState, useEffect } from 'react';
const RateConverter = () => {
    const [convertFrom, setConvertFrom] = useState('EUR');
    const [convertTo, setConvertTo] = useState('USD');
    const [amount, setAmount] = useState(0);

    const [exchangeRate, setExchangeRate] = useState(0);

    useEffect(() => {
        if (!amount || convertFrom === convertTo) {
            setExchangeRate(0);
            return;
        }

        const controller = new AbortController();

        async function getExchangeRate() {
            setExchangeRate(0);
            try {
                const res = await fetch(
                    `https://api.frankfurter.app/latest?amount=${Number(
                        amount
                    )}&from=${convertFrom}&to=${convertTo}`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                if (!res.ok) throw new Error('Error fetching rate');
                console.log(data.rates[convertTo]);
                setExchangeRate(data.rates[convertTo]);
            } catch (error) {
                console.log(error.message);
            }
        }
        getExchangeRate();

        return () => {
            controller.abort();
        };
    }, [convertFrom, convertTo, amount]);

    return (
        <div className='App'>
            <input
                type='number'
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value, 10))}
            />
            <select
                name='from'
                id='from'
                value={convertFrom}
                onChange={(e) => setConvertFrom(e.target.value)}
            >
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='CAD'>CAD</option>
                <option value='INR'>INR</option>
            </select>
            <select
                name='to'
                id='to'
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value)}
            >
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='CAD'>CAD</option>
                <option value='INR'>INR</option>
            </select>

            <div>
                <h3>{exchangeRate || ''}</h3>
            </div>
        </div>
    );
};

export default RateConverter;
