SELECT shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled, geom
/*DELETE*/ FROM cdta_20130906_0131.shapes WHERE shape_id='1140026';
--INSERT INTO cdta_20130906_0131.shapes (SELECT * FROM cdta_20130906_0131_src.shapes WHERE shape_id='1140026');