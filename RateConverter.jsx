import { useEffect, useState } from 'react';

const RateConverter = () => {
    const [amount, setAmount] = useState('');
    const [from, setFrom] = useState('EUR');
    const [to, setTo] = useState('USD');
    const [output, setOutput] = useState('');

    useEffect(() => {
        if (!Number(amount)) return;
        const controller = new AbortController();
        async function getExchangeRate() {
            try {
                setAmount(null);
                const res = await fetch(
                    `https://api.frankfurter.app/latest?amount=${Number(
                        amount
                    )}&from${from}&to=${to}`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                setOutput(data.rates[to]);
            } catch (error) {
                console.log(error.message);
            }
        }
        getExchangeRate();

        return () => {
            controller.abort();
        };
    }, [from, to, amount]);
    return (
        <div className='App'>
            <input
                type='text'
                placeholder='amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <select
                name='from'
                value={from}
                onChange={(e) => setFrom(e.target.value)}
            >
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='CAD'>CAD</option>
                <option value='INR'>INR</option>
            </select>
            <select
                name='to'
                value={to}
                onChange={(e) => setTo(e.target.value)}
            >
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='CAD'>CAD</option>
                <option value='INR'>INR</option>
            </select>
            <div>
                <h3>{amount && output}</h3>
            </div>
        </div>
    );
};

export default RateConverter;
