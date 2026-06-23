import { Item } from '../items/entities/item.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SyncStatus } from '../common/sync.enum';

@Entity()
export class TodoList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  externalId: number | null;

  @Column({
    default: false,
  })
  isDeletedLocally: boolean;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  syncStatus: SyncStatus;

  @OneToMany(() => Item, (item) => item.todoList)
  item: Item[];
}
