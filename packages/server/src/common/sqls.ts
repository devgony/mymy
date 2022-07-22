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
