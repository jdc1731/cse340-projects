INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE public.account SET account_type = 'Admin' WHERE account_firstname ='Tony' and account_lastname ='Stark';

DELETE FROM public.account
WHERE account_firstname = 'Tony'
  AND account_lastname  = 'Stark';

  UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE inv_make ='GM' AND inv_model = 'Hummer';

SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c
 ON i.classification_id = c.classification_id
 WHERE c.classification_name ='Sport';

UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');