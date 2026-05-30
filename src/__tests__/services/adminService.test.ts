import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminQueueState,
  callNextInQueue,
  skipNextInQueue,
  toggleQueuePause,
  recallSkippedToken,
  getHospitalQueueOverview,
} from '@/services/adminService';
import { mockQueueStates } from '@/lib/mockAdminData';

// All tests run in mock mode (NEXT_PUBLIC_SUPABASE_URL is not set in test env)

const DR_SHARMA_QUEUE_ID = 'mock-queue-sharma';
const DR_VERMA_QUEUE_ID  = 'mock-queue-verma';

beforeEach(() => {
  // Reset sharma queue to known state before each test
  mockQueueStates['dr.sharma'] = {
    queueId:          DR_SHARMA_QUEUE_ID,
    doctorId:         'mock-doctor-sharma',
    doctorName:       'Dr. A. Sharma',
    room:             'Room 4',
    departmentId:     'general',
    departmentName:   'General OPD',
    hospitalId:       'mock-hospital',
    currentToken:     11,
    currentTokenLabel: 'G-011',
    isPaused:         false,
    skipped:          [],
    lastCallAt:       Date.now() - 45_000,
    avgMins:          4,
    upcoming:         [
      { token: 12, label: 'G-012', patientName: 'Asha Devi', age: 32, gender: 'F' },
      { token: 13, label: 'G-013', patientName: 'Ramesh Kumar', age: 45, gender: 'M' },
      { token: 14, label: 'G-014', patientName: 'Sunita Sharma', age: 28, gender: 'F' },
    ],
    seenToday: 10,
  };
});

describe('getAdminQueueState', () => {
  it('returns queue state for a valid queueId', async () => {
    const state = await getAdminQueueState(DR_SHARMA_QUEUE_ID);
    expect(state).not.toBeNull();
    expect(state?.currentToken).toBe(11);
    expect(state?.doctorName).toBe('Dr. A. Sharma');
    expect(state?.upcoming).toHaveLength(3);
  });

  it('returns null for unknown queueId', async () => {
    const state = await getAdminQueueState('no-such-queue');
    expect(state).toBeNull();
  });
});

describe('callNextInQueue', () => {
  it('increments currentToken', async () => {
    const state = await callNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.currentToken).toBe(12);
    expect(state?.currentTokenLabel).toBe('G-012');
  });

  it('removes the called token from upcoming', async () => {
    const state = await callNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.upcoming.find((e) => e.token === 12)).toBeUndefined();
  });

  it('increments seenToday', async () => {
    const state = await callNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.seenToday).toBe(11);
  });

  it('does nothing when queue is paused', async () => {
    mockQueueStates['dr.sharma'].isPaused = true;
    const state = await callNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.currentToken).toBe(11); // unchanged
  });
});

describe('skipNextInQueue', () => {
  it('adds the next upcoming token to skipped list', async () => {
    const state = await skipNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.skipped).toHaveLength(1);
    expect(state?.skipped[0].token).toBe(12);
    expect(state?.skipped[0].label).toBe('G-012');
  });

  it('removes the token from upcoming', async () => {
    const state = await skipNextInQueue(DR_SHARMA_QUEUE_ID);
    expect(state?.upcoming.find((e) => e.token === 12)).toBeUndefined();
    expect(state?.upcoming[0].token).toBe(13);
  });
});

describe('toggleQueuePause', () => {
  it('pauses an active queue', async () => {
    const state = await toggleQueuePause(DR_SHARMA_QUEUE_ID);
    expect(state?.isPaused).toBe(true);
  });

  it('resumes a paused queue', async () => {
    mockQueueStates['dr.sharma'].isPaused = true;
    const state = await toggleQueuePause(DR_SHARMA_QUEUE_ID);
    expect(state?.isPaused).toBe(false);
  });
});

describe('recallSkippedToken', () => {
  it('moves a skipped token back to upcoming', async () => {
    await skipNextInQueue(DR_SHARMA_QUEUE_ID); // skip G-012
    const state = await recallSkippedToken(DR_SHARMA_QUEUE_ID, 12);
    expect(state?.skipped).toHaveLength(0);
    expect(state?.upcoming[0].token).toBe(12); // recalled to front
  });
});

describe('getHospitalQueueOverview', () => {
  it('returns summaries for all mock doctors', async () => {
    const summaries = await getHospitalQueueOverview('mock-hospital');
    expect(summaries.length).toBeGreaterThanOrEqual(4);
    const sharma = summaries.find((s) => s.queueId === DR_SHARMA_QUEUE_ID);
    expect(sharma).toBeDefined();
    expect(sharma?.doctorName).toBe('Dr. A. Sharma');
  });

  it('doctor A cannot see doctor B queue via this service (isolation)', async () => {
    // Both queues exist but are independent; verma queue is not changed by sharma actions
    const before = await getAdminQueueState(DR_VERMA_QUEUE_ID);
    await callNextInQueue(DR_SHARMA_QUEUE_ID);
    const after = await getAdminQueueState(DR_VERMA_QUEUE_ID);
    expect(before?.currentToken).toBe(after?.currentToken);
  });
});
