import { MarketMindPage } from '@/components/market-mind-page';
import { StrategyDetails } from '@/components/strategy-details';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  return (
    <>
      <MarketMindPage />
      <div className="container max-w-screen-lg mx-auto py-8 md:py-12">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-2xl font-headline font-bold">
              Trading Strategy Explained
            </AccordionTrigger>
            <AccordionContent>
              <StrategyDetails />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
