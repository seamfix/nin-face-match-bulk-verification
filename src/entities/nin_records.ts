import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NinBulkVerifications } from './nin_bulk_verifications';

@Entity('nin_records')
export class NinRecords {
  @PrimaryGeneratedColumn()
  pk: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_date: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  modified_date: Date;

  @Column({
    type: 'enum',
    enum: ['VERIFIED', 'NOT_VERIFIED', 'FAILED'],
    nullable: true,
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  failure_reason: string;

  @Column({
    type: 'enum',
    enum: ['SUCCESSFUL', 'FAILED'],
    nullable: true,
  })
  transaction_status: string;

  @ManyToOne(() => NinBulkVerifications, (bulk) => bulk.records)
  @JoinColumn([{ name: 'bulk_fk', referencedColumnName: 'pk' }])
  bulkFk: NinBulkVerifications;

  @Column({ type: 'varchar' })
  search_parameter: string;

  @Column({ type: 'varchar' })
  retrieval_mode: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
  })
  job_status: string;

  @Column({ type: 'varchar', name: 'sftp_file_name' })
  sftpFileName: string;

  @Column({ type: 'varchar', name: 'sftp_folder_name' })
  sftpFolderName: string;

  @Column({ type: 'varchar', name: 'face_match_score' })
  faceMatchScore: string;

  @Column({ type: 'varchar', name: 'face_match_status' })
  faceMatchStatus: string;
}
