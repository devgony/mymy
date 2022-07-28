export const sqlPerf = `select
max(if(variable_name = 'Innodb_buffer_pool_reads', variable_value, NULL)) as Innodb_buffer_pool_reads
, max(if(variable_name = 'Bytes_sent', variable_value, NULL)) as Bytes_sent
, max(if(variable_name = 'Threads_connected', variable_value, NULL)) as Threads_connected
, max(if(variable_name = 'Threads_running', variable_value, NULL)) as Threads_running
, max(if(variable_name = 'Innodb_row_lock_waits', variable_value, NULL)) as Innodb_row_lock_waits
, max(if(variable_name = 'Innodb_rows_updated', variable_value, NULL)) as Innodb_rows_updated
from performance_schema.global_status
where variable_name in (
'Innodb_buffer_pool_reads'
,'Bytes_sent'
,'Threads_connected'
,'Threads_running'
,'Innodb_row_lock_waits'
,'Innodb_rows_updated'
)`;

export const sqlSessions = `SELECT a.id,
       CASE WHEN it.trx_id IS NOT NULL THEN
            (CASE WHEN dlw.blocking_engine_transaction_id IS NULL THEN 'Holder' ELSE NULL END)
               ELSE NULL
       END AS holder,
       b.thread_id ,
       a.user ,
       a.host ,
       a.db ,
       a.time "elapsed_time" ,
       round(c.timer_wait/1000000000000,3) "wait_time" ,
       c.event_id ,
       c.event_name ,
       CASE
            WHEN -1 < 0 THEN ifnull(a.info,'')
            ELSE SUBSTR(ifnull(a.info,''), 1, -1)
       END "sqltext",
       a.command ,
       a.state ,
       c.source ,
       ifnull(c.spins,'') spins ,
       ifnull(c.object_schema,'') object_schema ,
       ifnull(c.object_name,'') object_name ,
       ifnull(c.object_type,'') object_type ,
       c.object_instance_begin ,
       c.operation ,
       ifnull(c.number_of_bytes,'') number_of_bytes ,
       b.processlist_id   process_id
FROM information_schema.processlist a left join
   performance_schema.threads b on b.processlist_id = a.id left join
   performance_schema.events_waits_current c on b.thread_id=c.thread_id left join
   information_schema.innodb_trx it on it.trx_mysql_thread_id = a.id left join
   performance_schema.data_lock_waits dlw on dlw.requesting_thread_id = b.thread_id
WHERE  1=1
    and ( a.info is null or  a.info not like '-- #MYPROGRAM#%' )
    AND lower(a.state) not like '%waiting for master to send event%'
    AND lower(a.state) not like '%master has sent all binlog to slave%'
    AND lower(a.state) not like '%waiting for the slave i/o thread to update%'
    AND lower(a.state) not like '%queueing%'
    AND lower(a.state) not like '%slave has read all relay log%'
    AND lower(a.state) not like '%reading event from the relay log%'
order by a.time desc`;
