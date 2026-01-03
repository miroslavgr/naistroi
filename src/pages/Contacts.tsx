import { Phone, Mail, MapPin } from 'lucide-react';

export const Contacts = () => (
    <div className="container mx-auto px-4 py-20 text-center">
         <h1 className="text-4xl font-heading font-bold mb-8 text-neutral-900 uppercase">Контакти</h1>
         <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-lg border border-slate-100">
             <div className="space-y-6 text-lg text-slate-600">
                 <p className="flex items-center justify-center gap-3"><Phone className="text-orange-500"/> +359 888 123 456</p>
                 <p className="flex items-center justify-center gap-3"><Mail className="text-orange-500"/> office@naistroitrans.bg</p>
                 <p className="flex items-center justify-center gap-3"><MapPin className="text-orange-500"/> с. Вакарел, Индустриална зона</p>
             </div>
         </div>
    </div>
);