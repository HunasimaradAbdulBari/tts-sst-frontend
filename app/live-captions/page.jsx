// app/live-captions/page.jsx
import LiveCaptionScreen from '../components/LiveCaptionScreen';

export const metadata = {
  title: 'Live Captions - Voice AI',
  description: 'Real-time speech recognition with live captions',
};

export default function LiveCaptionsPage() {
  return <LiveCaptionScreen />;
}