/**
 * Shared Kafka client factory.
 *
 * Reads broker + optional SASL/SSL env vars so the same config is used
 * by both the consumer and the producer.
 *
 * When KAFKA_SASL_USERNAME and KAFKA_SASL_PASSWORD are set (Confluent Cloud)
 * the client is configured with SASL_SSL automatically.
 */
import { Kafka, type KafkaConfig } from 'kafkajs'

export function createKafkaClient(clientId: string): Kafka {
  const brokers = (process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'kafka:9092').split(',')

  const config: KafkaConfig = {
    clientId,
    brokers,
  }

  // Enable SASL/SSL when Confluent Cloud credentials are present
  if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
    config.ssl = true
    config.sasl = {
      mechanism: ((process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512') ?? 'plain').toLowerCase() as 'plain' | 'scram-sha-256' | 'scram-sha-512',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    }
  }

  return new Kafka(config)
}
