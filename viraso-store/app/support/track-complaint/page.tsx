import { TrackComplaintView } from "@/components/track-complaint-view";

export const metadata = {
  title: "Track Your Complaint | Viraso",
  description:
    "Track the status of your product complaint using your Complaint ID (VC-XXXXXX) with Viraso support.",
};

export default function SupportTrackComplaintPage() {
  return <TrackComplaintView />;
}
