PRAGMA foreign_keys = ON;

-- Fix duplicate branch_order values where trunk edges and non-trunk edges shared the same order.
-- Lint requires branch_order to be unique per (map_id, from_node_id).

BEGIN;

-- For trunk nodes, reserve branch_order=1 for the trunk edge, and shift non-trunk children to 2–4.

UPDATE edge SET branch_order = 2 WHERE id = 'edge_autopilot__goal_000230';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_autopilot__scope_000231';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_autopilot__constraints_000232';

UPDATE edge SET branch_order = 2 WHERE id = 'edge_signals__ranks_000233';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_signals__serp_000234';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_signals__health_000235';

UPDATE edge SET branch_order = 2 WHERE id = 'edge_filters__near_page_one_000236';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_filters__movers_000237';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_filters__value_000238';

UPDATE edge SET branch_order = 2 WHERE id = 'edge_decisions__content_000239';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_decisions__page_improve_000240';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_decisions__risk_000241';

UPDATE edge SET branch_order = 2 WHERE id = 'edge_work_orders__types_000252';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_work_orders__queue_000253';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_work_orders__pr_cadence_000254';

UPDATE edge SET branch_order = 2 WHERE id = 'edge_execution__blog_writer_000260';
UPDATE edge SET branch_order = 3 WHERE id = 'edge_execution__delivery_000261';
UPDATE edge SET branch_order = 4 WHERE id = 'edge_execution__internal_links_000262';

COMMIT;
