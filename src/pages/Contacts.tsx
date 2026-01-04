import { Phone, Mail, MapPin } from 'lucide-react';

export const Contacts = () => (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="container mx-auto px-4">
         <h1 className="text-5xl font-heading font-bold mb-12 text-center text-neutral-900 uppercase">Свържете се с нас</h1>
         
         <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Contact Info */}
            <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-slate-100 space-y-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                    Имате въпроси или се нуждаете от консултация? Не се колебайте да се свържете с нас.
                    Нашият екип е на разположение, за да отговори на всички ваши запитвания.
                </p>

                <div className="space-y-6 text-lg text-neutral-800 font-medium">
                    <div className="flex items-center gap-4">
                        <Phone className="text-orange-600 shrink-0" size={24} />
                        <a href="tel:0884045444" className="hover:text-orange-600 transition">0884 045 444</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Mail className="text-orange-600 shrink-0" size={24} />
                        <a href="mailto:office@naistroitrans.bg" className="hover:text-orange-600 transition">office@naistroitrans.bg</a>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="text-orange-600 shrink-0 mt-1" size={24} />
                        <span>с. Нови Хан, Индустриална зона</span>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-xl font-heading font-bold text-neutral-900 mb-4">Работно време:</h3>
                    <ul className="text-slate-600 space-y-2">
                        <li>Понеделник - Петък: 09:00 - 18:00 ч.</li>
                        <li>Събота: 10:00 - 14:00 ч.</li>
                        <li>Неделя: Почивен ден</li>
                    </ul>
                </div>
            </div>

            {/* Google Map Embed */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 aspect-video w-full">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.748641178619!2d23.66907007621184!3d42.54318932454655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDIuNTQzMTg5LDIzLjY3MTY0NQ!5e0!3m2!1sen!2sbg!4v1678912345678!5m2!1sen!2sbg"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Местоположение на НайСтрой Транс"
                ></iframe>
            </div>
         </div>

      </div>
    </div>
);