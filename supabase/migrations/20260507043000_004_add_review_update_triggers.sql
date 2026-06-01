/*
  # Add Triggers to Update Attraction Ratings

  Automatically updates attraction.rating and attraction.review_count 
  when reviews are inserted, updated, or deleted.
*/

-- Function to update attraction rating and review count
CREATE OR REPLACE FUNCTION update_attraction_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update attraction rating and review count
  UPDATE attractions
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)::numeric(3,2)
      FROM reviews
      WHERE attraction_id = COALESCE(NEW.attraction_id, OLD.attraction_id)
        AND rating IS NOT NULL
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE attraction_id = COALESCE(NEW.attraction_id, OLD.attraction_id)
    ),
    updated_at = now()
  WHERE attraction_id = COALESCE(NEW.attraction_id, OLD.attraction_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT
DROP TRIGGER IF EXISTS review_insert_update_attraction ON reviews;
CREATE TRIGGER review_insert_update_attraction
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_attraction_rating();

-- Trigger on UPDATE
DROP TRIGGER IF EXISTS review_update_update_attraction ON reviews;
CREATE TRIGGER review_update_update_attraction
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_attraction_rating();

-- Trigger on DELETE
DROP TRIGGER IF EXISTS review_delete_update_attraction ON reviews;
CREATE TRIGGER review_delete_update_attraction
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_attraction_rating();
