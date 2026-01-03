import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export const Login = () => {
    const { login, register } = useStore();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await register({ email, password, name, phone, address });
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err: any) {
            let msg = "Възникна грешка.";
            if (err.code === 'auth/invalid-credential') msg = "Грешен имейл или парола.";
            if (err.code === 'auth/email-already-in-use') msg = "Този имейл вече е регистриран.";
            if (err.code === 'auth/weak-password') msg = "Паролата трябва да е поне 6 символа.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-20 flex justify-center animate-fade-in">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <h2 className="text-3xl font-heading font-bold mb-2 text-center text-neutral-900 uppercase">{isRegistering ? 'Регистрация' : 'Вход'}</h2>
                <p className="text-center text-slate-500 mb-6 text-sm">{isRegistering ? 'Създайте профил за по-бързи поръчки' : 'Влезте в своя профил'}</p>
                {error && (<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold border border-red-100 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>)}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <>
                            <input required type="text" placeholder="Име и Фамилия" className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
                            <input required type="tel" placeholder="Телефон" className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
                            <input required type="text" placeholder="Адрес за доставка" className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" value={address} onChange={e => setAddress(e.target.value)} />
                        </>
                    )}
                    <input required type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                    <input required type="password" placeholder="Парола" className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold uppercase hover:bg-orange-600 transition disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : (isRegistering ? 'Регистрирай се' : 'Влез')}
                    </button>
                </form>
                <div className="mt-6 text-center pt-6 border-t border-slate-100">
                    <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-orange-600 font-bold hover:underline text-sm uppercase tracking-wide">
                        {isRegistering ? 'Вече имаш профил? Влез тук' : 'Нямаш профил? Регистрирай се'}
                    </button>
                </div>
            </div>
        </div>
    )
}