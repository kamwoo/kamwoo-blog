import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';

const DoyeonPage = () => {
  return Buses.map((bus) => (
    <Accordion type='single' collapsible key={bus.path} className='w-full'>
      <AccordionItem value='bus'>
        <AccordionTrigger>{bus.path}</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>평일</TableHead>
                <TableHead>토,일(공휴일)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow key={bus.path}>
                <TableCell className='w-1/2 border-r align-top'>
                  <div className='grid grid-cols-2 w-full'>
                    {bus.weekdays.map((time) => (
                      <div key={time} className='px-2 py-1 border bg-muted/20'>
                        {time}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='w-1/2 align-top'>
                  <div className='grid grid-cols-2 w-full'>
                    {bus.weekends.map((time) => (
                      <div key={time} className='px-2 py-1 border bg-muted/20'>
                        {time}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ));
};

const Buses = [
  {
    path: '석수 3동 -> 사당역',
    weekdays: [
      '04:50',
      '05:20',
      '05:50',
      '06:20',
      '06:50',
      '07:05',
      '07:20',
      '07:35',
      '07:50',
      '08:10',
      '08:40',
      '09:20',
      '10:00',
      '10:40',
      '11:20',
      '12:00',
      '12:40',
      '13:20',
      '14:00',
      '14:40',
      '15:20',
      '16:00',
      '16:30',
      '16:50',
      '17:10',
      '17:30',
      '18:00',
      '18:30',
      '19:10',
      '19:50',
      '20:30',
      '21:10',
      '21:45',
      '22:20',
      '22:55',
      '23:30',
    ],
    weekends: [
      '04:50',
      '05:20',
      '05:50',
      '06:20',
      '06:50',
      '07:10',
      '07:50',
      '08:10',
      '08:40',
      '09:10',
      '09:40',
      '10:10',
      '10:50',
      '11:30',
      '12:10',
      '12:40',
      '13:10',
      '13:40',
      '14:20',
      '15:00',
      '15:30',
      '16:00',
      '16:40',
      '17:20',
      '18:00',
      '18:30',
      '19:00',
      '19:40',
      '20:20',
      '21:00',
      '21:30',
      '22:00',
      '22:30',
      '23:00',
      '23:30',
    ],
  },
  {
    path: '사당역 -> 석수 3동 (평균)',
    weekdays: [
      '05:20',
      '05:52',
      '06:25',
      '06:57',
      '07:45',
      '08:20',
      '08:50',
      '09:23',
      '10:05',
      '10:45',
      '11:17',
      '11:57',
      '12:35',
      '13:20',
      '13:58',
      '14:40',
      '15:20',
      '15:54',
      '16:38',
      '17:08',
      '17:35',
      '17:55',
      '18:15',
      '18:45',
      '19:10',
      '19:50',
      '20:22',
      '21:02',
      '21:40',
      '22:15',
      '22:50',
      '23:20',
      '23:55',
    ],
    weekends: [
      '05:17',
      '05:48',
      '06:22',
      '06:46',
      '07:18',
      '07:37',
      '08:20',
      '08:40',
      '09:04',
      '09:46',
      '10:14',
      '10:47',
      '11:24',
      '12:07',
      '12:56',
      '13:15',
      '13:47',
      '14:18',
      '14:56',
      '15:43',
      '16:03',
      '16:44',
      '17:17',
      '17:59',
      '18:37',
      '18:59',
      '19:35',
      '20:13',
      '20:50',
      '21:30',
      '21:58',
      '22:29',
      '22:54',
      '23:27',
      '23:53',
    ],
  },
];

export default DoyeonPage;
