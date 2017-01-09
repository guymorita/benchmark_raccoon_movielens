# Movielens 100k Benchmark using Raccoon

Movielens is a popular recommendation engine test data set. Original can be found here: http://grouplens.org/datasets/movielens/100k/ . Users were selected at random for inclusion. All users selected had rated at least 20 movies. Unlike previous MovieLens data sets, no demographic information is included. Each user is represented by an id, and no other information is provided.

Raccoon https://github.com/guymorita/recommendationRaccoon is an easy-to-use collaborative filtering based recommendation engine and NPM module built on top of Node.js and Redis. The engine uses the Jaccard coefficient to determine the similarity between users and k-nearest-neighbors to create recommendations.

This repository is a test of raccoon using the Movielens 100k data set. The full description of how to run the test and the results are below. There are some pretty clear areas for optimization. I would love for any help in investigating:

- Bottlenecks in the raccoon algorithms
- How to lower the time by an order of magnitude. Currently at 25.3 minutes to finish all 100k entries and predictions
- How to get a more accurate RMSE. Raccoon is designed for predictions between -1 and 1 (often very close to zero) while the Movielens dataset is evenly distributed between 1 and 5.
- How to make it consume less memory. Currently while its running at its peak, node requires up to 5GB and is running over 100k instantaneous_ops_per_sec

Primary Statistics:
- Prediction Accuracy: 0.7106% -- 14,189 out of 19,968 correct
- Total time: 25.3 min
- Redis total_commands_processed: 26,591,038

## How to run test

Clone / cd into directory

``` bash
npm install
brew install redis
redis-server
```

Run node with increased memory allocation
``` bash
node --max_old_space_size=8100 --optimize_for_size --max_executable_size=8100 --stack_size=8100 test.js
```

If you want to customize which test pool to use, you can change the these lines in config.js
``` js
this.baseDataPool = 'u1.base.yaml';
this.testDataPool = 'u1.test.yaml';
```

If you want to change the number of users to make predictions for, you can change this line in config.js
``` js
this.numUsersToTest = 943;
```

If you want heapdumps, you can uncomment
``` js
// generateHeapDumpAndStats();

// setInterval(generateHeapDumpAndStats, 2000); //Do garbage collection and heap dump every 2 seconds
```

## Other helpful tools to run with test

### Redis shell

``` bash
redis-cli
monitor
```

### RDM
https://redisdesktop.com/

### Redis stat
https://github.com/junegunn/redis-stat

## Current benchmarks

For the test including all 100,000 reviews, the stats were as follows. Keep in mind that for this test, raccoon's recommendations were turned into binary 0's or 1's and the ratings were change from 1-3 to 0 and from 4-5 to 1. This means that when raccoon makes a guess it is exactly right or exactly wrong.

Compared 943 users
- RMSE = 0.5712
- Prediction Accuracy: 0.7106% -- 14189 out of 19968 correct
- Unrated: 0.0016% -- 32 out of 20000 total
- Guessed high: 0.6560% -- 3791 high out of 5779 wrong
- Total time: 25.3 min

## Redis Info

### Server
- redis_version:3.2.6
- redis_git_sha1:00000000
- redis_git_dirty:0
- redis_build_id:1ef1a7bf74a705e5
- redis_mode:standalone
- os:Darwin 14.5.0 x86_64
- arch_bits:64
- multiplexing_api:kqueue
- gcc_version:4.2.1
- process_id:2278
- run_id:ce00cc046008eee0b706f891f840c40a9167b7be
- tcp_port:6379
- uptime_in_seconds:2626
- uptime_in_days:0
- hz:10
- lru_clock:7582645
- executable:/Users/guymorita/redis-server
- config_file:

### Clients
- connected_clients:2
- client_longest_output_list:0
- client_biggest_input_buf:0
- blocked_clients:0

### Memory
- used_memory:84214816
- used_memory_human:80.31M
- used_memory_rss:287903744
- used_memory_rss_human:274.57M
- used_memory_peak:428091184
- used_memory_peak_human:408.26M
- total_system_memory:17179869184
- total_system_memory_human:16.00G
- used_memory_lua:37888
- used_memory_lua_human:37.00K
- maxmemory:0
- maxmemory_human:0B
- maxmemory_policy:noeviction
- mem_fragmentation_ratio:3.42
- mem_allocator:libc

### Persistence
- loading:0
- rdb_changes_since_last_save:0
- rdb_bgsave_in_progress:0
- rdb_last_save_time:1483977563
- rdb_last_bgsave_status:ok
- rdb_last_bgsave_time_sec:0
- rdb_current_bgsave_time_sec:-1
- aof_enabled:0
- aof_rewrite_in_progress:0
- aof_rewrite_scheduled:0
- aof_last_rewrite_time_sec:-1
- aof_current_rewrite_time_sec:-1
- aof_last_bgrewrite_status:ok
- aof_last_write_status:ok

### Stats
- total_connections_received:2
- total_commands_processed:26591038
- instantaneous_ops_per_sec:0
- total_net_input_bytes:1662496069
- total_net_output_bytes:119113895540
- instantaneous_input_kbps:0.00
- instantaneous_output_kbps:0.00
- rejected_connections:0
- sync_full:0
- sync_partial_ok:0
- sync_partial_err:0
- expired_keys:0
- evicted_keys:0
- keyspace_hits:28725883
- keyspace_misses:95512
- pubsub_channels:0
- pubsub_patterns:0
- latest_fork_usec:1885
- migrate_cached_sockets:0

### Replication
- role:master
- connected_slaves:0
- master_repl_offset:0
- repl_backlog_active:0
- repl_backlog_size:1048576
- repl_backlog_first_byte_offset:0
- repl_backlog_histlen:0

### CPU
- used_cpu_sys:81.84
- used_cpu_user:131.83
- used_cpu_sys_children:0.17
- used_cpu_user_children:1.78

### Cluster
- cluster_enabled:0

### Keyspace
- db0:keys=6786,expires=0,avg_ttl=0