"use client";

import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import { QuestionsStatsCard } from "@/components/QuestionsStatsCard";
import { QuestionHistoryCard } from "@/components/QuestionHistoryCard";
import { ProfileCard } from "@/components/ProfileCard";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <GridItem colSpan={{ base: 1, md: 1 }} rowSpan={2}>
          <ProfileCard />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <QuestionsStatsCard />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <QuestionHistoryCard />
        </GridItem>
      </Grid>
    </div>
  );
}
