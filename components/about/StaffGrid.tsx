import Image from 'next/image';
import Link from 'next/link';
import { getActiveStaff } from '@/lib/data/staff';

export async function StaffGrid() {
  const staff = await getActiveStaff();

  if (staff.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white" aria-label="Notre équipe">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-cormorant italic text-blossome-gold text-lg mb-2">
            Des expertes passionnées
          </p>
          <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-blossome-brown">
            Notre Équipe
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => {
            const personSchema = {
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: member.full_name,
              jobTitle: member.role,
              worksFor: {
                '@type': 'Organization',
                name: 'Blossome Institut de Beauté',
              },
              ...(member.avatar_url ? { image: member.avatar_url } : {}),
            };

            return (
              <div
                key={member.id}
                className="group text-center bg-blossome-cream/50 rounded-2xl p-8 border border-blossome-taupe/10 hover:shadow-lg hover:border-blossome-gold/20 transition-all duration-300"
              >
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
                />

                {/* Avatar */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-blossome-gold/20 group-hover:ring-blossome-gold/50 transition-all duration-300">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={`${member.full_name}, ${member.role} chez Blossome`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-blossome-taupe/30 flex items-center justify-center">
                      <span className="text-3xl font-cormorant font-bold text-blossome-brown">
                        {member.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-cormorant text-xl md:text-2xl font-semibold text-blossome-brown mb-1">
                  {member.full_name}
                </h3>
                <p className="text-blossome-gold text-sm font-medium mb-3">
                  {member.role}
                </p>
                {member.bio && (
                  <p className="text-blossome-mid text-sm leading-relaxed mb-5 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={`/booking?staff=${member.id}` as never}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-blossome-brown border-2 border-blossome-brown rounded-full hover:bg-blossome-brown hover:text-white transition-colors duration-300"
                >
                  Réserver avec {member.full_name.split(' ')[0]}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
