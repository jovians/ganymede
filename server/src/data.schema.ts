/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export enum DataType {
  String = 1, 
  Number = 2,
  Date = 3, 
  HighPrecision = 4,
  Binary = 5,
}

/**
 * Template data schema with variable data endpoints
 */
export interface DataClassSchemaTemplate<T> {
  goopId?: string;
  name?: string;
  data: T;
}

/**
 * Template data schema with variable data endpoints
 */
export interface DataClassAtom<T> {
  goopId?: string;
  name?: string;
  data: T;
}

/**
 * Data class with concrete data endpoints (resolved)
 */
export interface DataClassDefinition<T> {
  goopIndex?: string;
  name?: string;
  description?: string;
  examples: T[];
  properties: DataClassDefinitionProperty[];
}

export interface DataClassDefinitionProperty {
  name?: string;
  type?: string;
  defaultValue: any;
  filter?: () => {};
}
