import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { InView } from "@/components/motion/InView";
import { ClosingBand } from "@/components/pages/blog/ClosingBand";
import { countLabel, orEmpty, responsiveImage } from "@/components/pages/blog/helpers";
import { PrimaryAction, TextAction } from "@/components/pages/blog/ui";
import { PersonCard, type Person } from "@/components/pages/team/PersonCard";
import { getPage } from "@/lib/cms/content";
import { getSiteSettings, getTeamMembers } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Our Team",
  description:
    "The architects and interior designers behind F.QUAD Studio in Hyderabad: meet the principals and the people who carry each project from first sketch to handover.",
  path: "/team",
});

export default async function TeamPage() {
  const [members, content, about, settings] = await Promise.all([
    // Falls through to the CMS founders below when the database is unreachable.
    orEmpty(getTeamMembers()),
    getPage("team"),
    getPage("about"),
    getSiteSettings().catch(() => null),
  ]);

  const hero = content.hero;
  const email = settings?.email || SITE.fallback.email;

  const people: (Person & { featured: boolean })[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    bio: m.bio,
    linkedIn: m.linkedIn,
    image: responsiveImage(m.media, "medium"),
    alt: m.media?.alt,
    featured: m.featured,
  }));
  const principals = people.filter((p) => p.featured);
  const studio = people.filter((p) => !p.featured);

  // With no published team members, the founders already written for the
  // About page are the team. (`portrait` is '' until a photo is uploaded.)
  const founders: Person[] = (
    (about.founders?.people ?? []) as { name?: string; role?: string; portrait?: string; bio?: string }[]
  )
    .filter((f) => f?.name)
    .map((f, i) => ({
      id: `founder-${i}`,
      name: f.name as string,
      role: f.role ?? "",
      bio: f.bio,
      image: f.portrait ? { src: f.portrait } : null,
    }));

  const hasTeam = people.length > 0;
  const intro =
    (typeof hero.intro === "string" && hero.intro) ||
    "The people behind every F.QUAD project: the principals who lead each brief, and the studio that carries it from first sketch to handover.";

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} intro={intro} art="living">
        <PrimaryAction action={{ label: "Start a project", startProject: true }} />
        <TextAction action={{ label: "Read our story →", href: "/about" }} />
      </PageHero>

      {hasTeam ? (
        <>
          {principals.length > 0 && (
            <Section
              eyebrow={studio.length > 0 ? "Principals" : "The team"}
              aside={
                <span className="text-white/60">{countLabel(principals.length, "person", "people")}</span>
              }
            >
              <ul
                role="list"
                className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-14 max-w-[1500px]"
              >
                {principals.map((person, i) => (
                  <li key={person.id} className="min-w-0">
                    <PersonCard person={person} variant="lead" index={i} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {studio.length > 0 && (
            <>
              {/* Header only: a long grid inside one Section would sit in a single
                  tall observer that may never reach its 15% threshold. Each card
                  reveals on its own instead. */}
              <Section
                eyebrow={principals.length > 0 ? "The studio" : "The team"}
                aside={
                  <span className="text-white/60">{countLabel(studio.length, "person", "people")}</span>
                }
                className={principals.length > 0 ? "!pt-0 !pb-0" : "!pb-0"}
              >
                {null}
              </Section>
              <div className="px-6 sm:px-14 pb-20 sm:pb-28">
                <ul
                  role="list"
                  className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-14 max-w-[1500px]"
                >
                  {studio.map((person, i) => (
                    <InView as="li" key={person.id} className="min-w-0">
                      <PersonCard person={person} variant="grid" index={i % 3} />
                    </InView>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      ) : (
        founders.length > 0 && (
          <Section
            eyebrow={about.founders?.eyebrow || "Meet the founders"}
            aside={
              <span className="text-white/60">{countLabel(founders.length, "founder", "founders")}</span>
            }
          >
            <ul
              role="list"
              className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-14 max-w-[1500px]"
            >
              {founders.map((person, i) => (
                <li key={person.id} className="min-w-0">
                  <PersonCard person={person} variant="lead" index={i} />
                </li>
              ))}
            </ul>
          </Section>
        )
      )}

      {hasTeam ? (
        <ClosingBand
          eyebrow="Work with us"
          title={"Let's talk\nabout your space."}
          body="Tell us what you have in mind. The people above will take it from there."
          primary={{ label: "Start a project", startProject: true }}
          secondary={{ label: "Contact the studio →", href: "/contact" }}
        />
      ) : (
        <ClosingBand
          eyebrow="The wider studio"
          title={"Meet the studio,\non request."}
          body="We don't profile the whole team online. If you'd like to meet the people who would work on your project, ask and we'll make the introductions."
          primary={{
            label: "Ask for an introduction",
            href: `mailto:${email}?subject=${encodeURIComponent("Meeting the F.QUAD team")}`,
          }}
          secondary={{ label: "Start a project →", startProject: true }}
        />
      )}
    </PageShell>
  );
}
