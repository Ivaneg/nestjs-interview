import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';

@Processor('bulk-operations')
export class BulkOperationsProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {
    super();
  }

  async process(job: Job<{ todoListId: number }>): Promise<void> {
    const { todoListId } = job.data;

    await this.itemRepository
      .createQueryBuilder()
      .update(Item)
      .set({ done: true })
      .where('todoListId = :todoListId AND done = false', { todoListId })
      .execute();
  }

  /* Scaling architectural:
     If the volume of rows scales to a magnitude where single statement lock the
     database or degrade the performance of the query we should use a batch system and
     limit the amount of items that get's completed with each query. Something like:
      let modifiedRows = 0;
     do {
       const result = await this.itemRepository.query(
         `UPDATE item SET done = true 
          WHERE id IN (
            SELECT id FROM item 
            WHERE todoListId = $1 AND done = false 
            LIMIT 5000
          )`, [todoListId]
       );
       modifiedRows = result[1];
     } while (modifiedRows > 0);
    */
}
