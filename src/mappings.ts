import {Address, ethereum} from '@graphprotocol/graph-ts'

// Generic schemas across all factories and subgraphs
import {ERC20} from './generated/AerodromeFactory/ERC20'
import {Pool, PoolFactory, Token} from './generated/schema'

// Specific events for each factory
import {PoolCreated as AerodromePoolCreated} from './generated/AerodromeFactory/PoolFactory'
import {PairCreated as BasedV2PoolCreated} from './generated/BasedV2Factory/PoolFactory'
import {PairCreated as CamelotPoolCreated} from './generated/CamelotFactory/PoolFactory'
import {PairCreated as EqualizerV2PoolCreated} from './generated/EqualizerV2Factory/PoolFactory'
import {PairCreated as EqualizerV3PoolCreated} from './generated/EqualizerV3Factory/PoolFactory'
import {PairCreated as PancakeswapV2PoolCreated} from './generated/PancakeswapV2Factory/PoolFactory'
import {PairCreated as RamsesPoolCreated} from './generated/RamsesFactory/PoolFactory'
import {PairCreated as SpookyswapV2PoolCreated} from './generated/SpookyswapV2Factory/PoolFactory'
import {PoolCreated as VelodromePoolCreated} from './generated/VelodromeFactory/PoolFactory'
import {PairCreated as WigoswapV2PoolCreated} from './generated/WigoswapV2Factory/PoolFactory'

export function onAerodromeV2PoolCreated(event: AerodromePoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pool, event.params.stable)
}

export function onBasedV2PoolCreated(event: BasedV2PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, false)
}

export function onCamelotPoolCreated(event: CamelotPoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, false)
}

export function onEqualizerV2PoolCreated(event: EqualizerV2PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, event.params.stable)
}

export function onEqualizerV3PoolCreated(event: EqualizerV3PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, event.params.stable)
}

export function onPancakeswapV2PoolCreated(event: PancakeswapV2PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, false)
}

export function onRamsesPoolCreated(event: RamsesPoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, event.params.stable)
}

export function onSpookyswapV2PoolCreated(event: SpookyswapV2PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, false)
}

export function onVelodromeV2PoolCreated(event: VelodromePoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pool, event.params.stable)
}

export function onWigoswapV2PoolCreated(event: WigoswapV2PoolCreated): void {
  _onPoolCreated(event, event.address, event.params.token0, event.params.token1, event.params.pair, false)
}

export function _onPoolCreated(
  event: ethereum.Event,
  factory: Address,
  token0Address: Address,
  token1Address: Address,
  poolAddress: Address,
  stable: boolean
): void {
  // Check if factory exists on boot
  upsertPoolFactory(factory)

  // Upsert token0 and token1
  const token0 = upsertToken(token0Address)
  const token1 = upsertToken(token1Address)

  // Create the pool
  const pool = new Pool(poolAddress.toHexString())
  pool.blockNumber = event.block.number
  pool.factory = factory.toHexString()
  pool.decimals = fetchTokenDecimals(poolAddress)
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.stable = stable
  pool.save()
}

function upsertPoolFactory(address: Address): PoolFactory {
  let factory = PoolFactory.load(address.toHexString())
  if (!factory) {
    factory = new PoolFactory(address.toHexString())
    factory.save()
  }
  return factory
}

function upsertToken(address: Address): Token {
  let token = Token.load(address.toHexString())
  if (!token) {
    token = new Token(address.toHexString())
    token.name = fetchTokenName(address)
    token.symbol = fetchTokenSymbol(address)
    token.decimals = fetchTokenDecimals(address)
    token.save()
  }
  return token
}

function fetchTokenName(address: Address): string {
  const contract = ERC20.bind(address)
  const result = contract.try_name()
  return result.reverted ? 'Unknown' : result.value
}

function fetchTokenSymbol(address: Address): string {
  const contract = ERC20.bind(address)
  const result = contract.try_symbol()
  return result.reverted ? 'Unknown' : result.value
}

function fetchTokenDecimals(address: Address): i32 {
  const contract = ERC20.bind(address)
  const result = contract.try_decimals()
  return result.reverted ? 18 : result.value
}
