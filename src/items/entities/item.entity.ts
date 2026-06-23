import { TodoList } from '../../todo_lists/todo_list.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { SyncStatus } from '../../common/sync.enum';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  done: boolean;

  @Column({
    type: 'int',
    nullable: true,
  })
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

  @ManyToOne(() => TodoList, (todoList) => todoList.item, {
    onDelete: 'CASCADE',
  })
  todoList: TodoList;
}
