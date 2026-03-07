import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Calendar, ExternalLink, Users } from "lucide-react";

const campaigns = [
  {
    title: "Clean Water for Rural Communities",
    description:
      "Funding boreholes, filtration kits, and local maintenance training in underserved areas.",
    raised: 45000,
    goal: 75000,
    supporters: 1234,
    daysLeft: 23,
    category: "Social Impact",
    image: "/students-coding.png",
  },
  {
    title: "Tech for Girls Initiative",
    description:
      "Providing devices, internet access, and mentorship tracks for girls entering STEM fields.",
    raised: 18000,
    goal: 40000,
    supporters: 654,
    daysLeft: 45,
    category: "Education",
    image: "/tech_for_girls.jpg",
  },
  {
    title: "Emergency Relief for Flood Victims",
    description:
      "Delivering immediate food, shelter, and medical support to affected families.",
    raised: 27000,
    goal: 60000,
    supporters: 1450,
    daysLeft: 12,
    category: "Disaster Relief",
    image: "/flood_relief.jpg",
  },
];

export function CampaignsShowcase() {
  return (
    <section id="campaigns" className="animate-in fade-in-0 duration-500 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured campaigns</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Highlighting active initiatives with clear goals, realistic timelines, and transparent progress.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/campaigns">View all campaigns</a>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.title} className="overflow-hidden border shadow-sm">
              <div className="aspect-video overflow-hidden border-b">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{campaign.category}</Badge>
                  <span className="text-xs text-muted-foreground">{campaign.daysLeft} days left</span>
                </div>
                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">${campaign.raised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${campaign.goal.toLocaleString()}</span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {campaign.supporters.toLocaleString()} supporters
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Active
                  </span>
                </div>

                <Button className="w-full" variant="outline">
                  View details
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
