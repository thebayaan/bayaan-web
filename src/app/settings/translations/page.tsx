import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TranslationSettings } from '@/components/translations/TranslationSettings';

export default function TranslationsSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader>Translation Settings</SectionHeader>

      <Card>
        <TranslationSettings />
      </Card>
    </div>
  );
}