import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { Heart, Users, Calendar, ExternalLink } from "lucide-react";

const campaigns = [
  {
    title: "Clean Water for Rural Communities",
    description:
      "Bringing clean, safe drinking water to underserved communities in developing regions.",
    raised: 45000,
    goal: 75000,
    supporters: 1234,
    daysLeft: 23,
    category: "Social Impact",
    image: "/placeholder-rcjq7.png",
  },
  {
    title: "Innovative Solar Panel Technology",
    description:
      "Revolutionary solar panel design that increases efficiency by 40% while reducing costs.",
    raised: 128000,
    goal: 200000,
    supporters: 856,
    daysLeft: 45,
    category: "Technology",
    image: "/modern-solar-rooftop.png",
  },
  {
    title: "Local Art Studio Expansion",
    description:
      "Expanding our community art studio to provide more space for local artists and workshops.",
    raised: 12500,
    goal: 25000,
    supporters: 189,
    daysLeft: 12,
    category: "Arts & Culture",
    image: "/bright-art-studio.png",
  },
];

export function CampaignsShowcase() {
  return (
    <section id="campaigns" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Featured <span className="font-mono text-primary">Campaigns</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover inspiring projects from creators around the world making a
            real difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {campaigns.map((campaign, index) => (
            <Card
              key={index}
              className="overflow-hidden border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa] hover:shadow-none transition-all group hover:-translate-y-1 hover:border hover:border-gray-300 min-h-56"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={campaign.image || "/placeholder.svg"}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-teal-100 text-teal-800"
                  >
                    {campaign.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-teal-700"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {campaign.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {campaign.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      ${campaign.raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-teal-700" />
                    <span>{campaign.supporters} supporters</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-teal-700" />
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Campaign
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Explore All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
}
