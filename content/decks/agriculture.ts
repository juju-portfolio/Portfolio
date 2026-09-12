import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'agriculture',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'From farming data to better questions.',
      introduction:
        'The Crop Cycle is a Tableau dashboard that brings crop, season, farming-method, and regional comparisons into one view.',
      section: 'PROJECT OVERVIEW',
      guide: {
        text: 'Each view answers a different question. I would start by choosing the crop and region, then read the comparisons in that context.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'questions',
          label: 'FOUR WAYS TO EXPLORE THE DATA',
          items: [
            {
              label: 'Crop + region',
              title: 'Choose the context',
              text: 'Crop and region filters set the scope of the dashboard view.',
            },
            {
              label: 'Season',
              title: 'Explore yield distribution',
              text: 'A seasonal view shows how yield is distributed across the displayed seasons.',
            },
            {
              label: 'Farming method',
              title: 'Compare expense and profit',
              text: 'The method view places expense and profit alongside each other.',
            },
            {
              label: 'Region + year',
              title: 'Compare periods',
              text: 'The regional view separates profit for 2023 and 2024.',
            },
          ],
        },
      ],
    },
    {
      id: 'dashboard',
      kind: 'image',
      title: 'One dashboard, several connected perspectives.',
      introduction:
        'The dashboard pairs summary totals with seasonal, method, and regional views. Crop and region filters sit alongside the comparisons.',
      guide: {
        text: 'The regional chart distinguishes 2023 and 2024. Keeping the period in view matters when comparing the bars.',
        pose: 'point',
        targetId: 'regional-view',
        dock: 'start',
      },
      image: {
        src: '/media/projects/agriculture/dashboard.png',
        width: 500,
        height: 400,
        alt: 'Tableau agriculture dashboard with crop and region filters, seasonal yield, farming-method expense and profit, and regional profit for 2023 and 2024.',
      },
      transcript:
        'The Crop Cycle: Seasons, Strategy & Success. Crop filters include Cotton, Maize, Rice, Sugarcane, and Wheat; region filters include East, North, South, and West. Summary measures are yield in tons, expense in INR, and revenue in INR. A pie chart shows season and yield. The farming-method view compares expense and profit. A regional profit chart distinguishes 2023 and 2024. These displayed totals describe the dataset, not the impact of the portfolio project.',
      hotspots: [
        {
          id: 'regional-view',
          x: 0.024,
          y: 0.59,
          width: 0.475,
          height: 0.36,
          label: 'Regional profit comparison by year',
        },
      ],
    },
    {
      id: 'interpretation',
      kind: 'native',
      title: 'A comparison needs a common basis.',
      introduction:
        'My next product review would focus on whether readers understand what is being compared before interpreting a difference as a recommendation.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'My priority would be interpretability: readers should be able to explain what a comparison does—and does not—show.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'comparison',
          label: 'CONTEXT I WOULD MAKE EXPLICIT',
          items: [
            {
              label: 'Time',
              title: 'Same period?',
              text: 'Keep the selected year or coverage visible beside the comparison. A difference across periods needs context.',
            },
            {
              label: 'Scale',
              title: 'Total or normalized?',
              text: 'Explain whether a value is a total or adjusted for a common basis before comparing differently sized groups.',
            },
            {
              label: 'Meaning',
              title: 'Expense, revenue, or profit?',
              text: 'Provide clear definitions so readers do not treat the three measures as interchangeable.',
            },
          ],
          takeaway:
            'A chart can reveal a difference without establishing what caused it or what action should follow.',
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Can a reader explain the comparison back?',
      introduction:
        'I would review the dashboard with a reader using one bounded task, then prioritize changes based on where their interpretation becomes uncertain.',
      section: 'HOW I WOULD TAKE THIS FORWARD',
      guide: {
        text: 'A useful test ends with an explanation from the reader, not just a completed click path.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'PROPOSED READER TASK',
          items: [
            {
              label: 'Select',
              title: 'One crop, two regions',
              text: 'Choose a crop and compare regions within a consistent period.',
            },
            {
              label: 'Explain',
              title: 'State the basis',
              text: 'Ask the reader to identify the measure, units, period, and comparison being made.',
            },
            {
              label: 'Improve',
              title: 'Fix the first misunderstanding',
              text: 'Use observed confusion to prioritize labels, definitions, or filter behavior before adding more charts.',
            },
          ],
        },
      ],
    },
  ],
};
export default deck;
