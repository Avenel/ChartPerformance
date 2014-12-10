using System;
using Xamarin.Forms;
using System.Collections.ObjectModel;
using System.Collections;
using System.Collections.Generic;
using System.Linq;


namespace ChartPerformance.ViewModels
{
    public abstract class MenuItem
    {
        public virtual string Title { get { var n = GetType().Name; return n.Substring(0, n.Length - 8); } }
        public virtual int Count { get; set; }
        public virtual bool Selected { get; set; }
        // public virtual string Icon { get { return Title.ToLower().TrimEnd('s') + ".png" ; } }
        // public ImageSource IconSource { get { return ImageSource.FromFile(Icon); } }
    }

    public class VerticalTGPixiMenuItem : MenuItem {
    }

    public class HorizontalTGPixiMenuItem : MenuItem {
    }

    public class BarChartPixiMenuItem : MenuItem {
    }

    public class ColumnChartPixiMenuItem : MenuItem {
    }

}


